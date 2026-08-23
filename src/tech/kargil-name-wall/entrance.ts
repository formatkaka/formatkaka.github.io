const beginButton = document.querySelector<HTMLButtonElement>('[data-experience-begin]');
const beginning = document.querySelector<HTMLElement>('#how-the-war-began');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const beginExperience = () => {
  beginning?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
};

beginButton?.addEventListener('click', beginExperience);
