// white-background.js
export function initialiseWhiteBackground(container) {
  // Method 1: Simply set CSS background (GPU literally does almost nothing)
  container.style.backgroundColor = '#000000';
  container.style.backgroundImage = 'none';

  // Optional: make sure nothing else interferes
  container.style.margin = '0';
  container.style.padding = '0';
  container.style.overflow = 'hidden';

  // Return cleanup (usually not even needed)
  return () => {
    container.style.backgroundColor = '';
    container.style.backgroundImage = '';
  };
}