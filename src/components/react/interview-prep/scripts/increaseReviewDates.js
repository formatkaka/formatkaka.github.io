// Script to increase problem review dates by 4 days (problems only)
// Run this in the browser console

(function () {
  const STORAGE_KEY = 'leetcodeProblems';
  const DAYS_TO_ADD = 4;

  function addDaysToDate(dateString, days) {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  // Update problems only
  try {
    const problemsJson = localStorage.getItem(STORAGE_KEY);
    if (problemsJson) {
      const problems = JSON.parse(problemsJson);
      const updatedProblems = problems.map((problem) => ({
        ...problem,
        nextReview: addDaysToDate(problem.nextReview, DAYS_TO_ADD),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProblems));
      console.log(`✅ Updated ${updatedProblems.length} problems`);
      console.log('🎉 Problem review dates increased by 4 days! Refresh the page to see changes.');
    } else {
      console.log('⚠️  No problems found in localStorage');
    }
  } catch (error) {
    console.error('❌ Error updating problems:', error);
  }
})();
