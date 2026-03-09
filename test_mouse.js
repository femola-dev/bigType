// Test script to simulate mouse movements
function simulateMouseMove(x, y) {
  const event = new MouseEvent('mousemove', {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y
  });
  document.elementFromPoint(x, y)?.dispatchEvent(event);
}

// Get image element
const img = document.querySelector('[class*="mainImage"]');
if (img) {
  const rect = img.getBoundingClientRect();
  console.log('Image position:', {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height
  });
  
  // Test top-right
  console.log('Testing top-right corner');
  simulateMouseMove(rect.right - 50, rect.top + 50);
  
  setTimeout(() => {
    console.log('Testing bottom-left corner');
    simulateMouseMove(rect.left + 50, rect.bottom - 50);
  }, 2000);
  
  setTimeout(() => {
    console.log('Mouse leave');
    simulateMouseMove(100, 100);
  }, 4000);
} else {
  console.error('Image not found');
}
