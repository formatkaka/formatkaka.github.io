"""Persist battle feedback as Galileo annotations."""

import logging
import os
from threading import Lock

import httpx
from galileo.projects import get_project

from ..config import get_settings

GALILEO_API_URL = "https://api.galileo.ai"
REACTION_TEMPLATE_NAME = "Enjoyed this battle?"
app_logger = logging.getLogger(__name__)


class GalileoFeedbackError(RuntimeError):
    """Raised when feedback cannot be sent to Galileo."""


class GalileoFeedbackService:
    """Attaches a thumbs-up/down annotation to a completed battle trace."""

    def __init__(self) -> None:
        self._template_ids: dict[str, str] = {}
        self._template_lock = Lock()

    def submit(self, *, trace_id: str, liked: bool) -> None:
        settings = get_settings()
        if not settings.galileo_api_key:
            raise GalileoFeedbackError("Feedback is unavailable because Galileo is not configured.")

        try:
            project = get_project(name=os.environ.get("GALILEO_PROJECT", "LLM-Wars"))
            if not project:
                raise GalileoFeedbackError("Could not find the Galileo project for feedback.")

            reaction_template_id = self._get_template_id(
                project.id,
                settings.galileo_api_key,
                name=REACTION_TEMPLATE_NAME,
                criteria="Would the user watch another LLM Wars debate like this?",
                annotation_type="like_dislike",
            )
            self._create_rating(
                project_id=project.id,
                template_id=reaction_template_id,
                trace_id=trace_id,
                api_key=settings.galileo_api_key,
                value=liked,
                annotation_type="like_dislike",
            )

        except GalileoFeedbackError:
            raise
        except Exception as error:
            app_logger.exception("Failed to save Galileo feedback for trace %s", trace_id)
            raise GalileoFeedbackError("Could not save feedback to Galileo.") from error

    def _get_template_id(
        self,
        project_id: str,
        api_key: str,
        *,
        name: str,
        criteria: str,
        annotation_type: str,
    ) -> str:
        if template_id := self._template_ids.get(name):
            return template_id

        with self._template_lock:
            if template_id := self._template_ids.get(name):
                return template_id

            headers = {"Galileo-API-Key": api_key}
            templates_response = httpx.get(
                f"{GALILEO_API_URL}/v2/projects/{project_id}/annotation/templates",
                headers=headers,
                timeout=10.0,
            )
            templates_response.raise_for_status()
            template_data = templates_response.json()
            if isinstance(template_data, dict):
                templates = template_data.get("templates") or template_data.get("annotation_templates") or []
            else:
                templates = template_data

            if not isinstance(templates, list):
                raise GalileoFeedbackError("Could not read Galileo feedback templates.")

            existing = next(
                (
                    item
                    for item in templates
                    if isinstance(item, dict) and item.get("name") == name
                ),
                None,
            )

            if existing:
                self._template_ids[name] = existing["id"]
                return self._template_ids[name]

            create_response = httpx.post(
                f"{GALILEO_API_URL}/v2/projects/{project_id}/annotation/templates",
                headers={**headers, "Content-Type": "application/json"},
                json={
                    "name": name,
                    "criteria": criteria,
                    "constraints": {"annotation_type": annotation_type},
                },
                timeout=10.0,
            )
            create_response.raise_for_status()
            self._template_ids[name] = create_response.json()["id"]
            return self._template_ids[name]

    @staticmethod
    def _create_rating(
        *,
        project_id: str,
        template_id: str,
        trace_id: str,
        api_key: str,
        value: bool,
        annotation_type: str,
    ) -> None:
        response = httpx.put(
            f"{GALILEO_API_URL}/v2/projects/{project_id}/annotation/templates/{template_id}/traces/{trace_id}/rating",
            headers={"Galileo-API-Key": api_key},
            json={"rating": {"value": value, "annotation_type": annotation_type}},
            timeout=10.0,
        )
        response.raise_for_status()
