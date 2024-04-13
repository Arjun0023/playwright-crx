import { Page, expect } from "playwright-crx/test";

interface CustomWindow extends Window {
  SpeechRecognition: new () => SpeechRecognition;
}

export async function createTodos(page: Page) {

  const TODO_ITEMS = [
    'buy some cheese',
    'feed the cat',
    'book a doctors appointment'
  ];

  await page.goto('https://demo.playwright.dev/todomvc');

  // delete all todos
  await page.evaluate(() => {
    if (localStorage?.length) {
      localStorage.clear();
      location.reload();
    }
  });

  // create a new todo locator
  const newTodo = page.getByPlaceholder('What needs to be done?');

  for (const item of TODO_ITEMS) {
    await newTodo.fill(item);
    await newTodo.press('Enter');
  }

  // assertions work too
  await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);

  // Add the circle button to the bottom right
  await page.evaluate(() => {
    const circleButton = document.createElement('div');
    circleButton.style.position = 'fixed';
    circleButton.style.bottom = '20px';
    circleButton.style.right = '20px'; // Change to move to the bottom right
    circleButton.style.width = '50px';
    circleButton.style.height = '50px';
    circleButton.style.borderRadius = '50%';
    circleButton.style.backgroundColor = 'red'; // Change color as per your design
    circleButton.style.cursor = 'pointer';
    circleButton.onclick = () => {
      const blueButton = document.createElement('button');
      blueButton.textContent = 'How can I help you?';
      blueButton.style.backgroundColor = 'blue';
      blueButton.style.color = 'white';
      blueButton.style.padding = '15px 30px'; // Increase size
      blueButton.style.border = 'none';
      blueButton.style.borderRadius = '5px';
      blueButton.style.position = 'fixed';
      blueButton.style.bottom = '50%'; // Center vertically
      blueButton.style.left = '50%'; // Center horizontally
      blueButton.style.transform = 'translate(-50%, -50%)'; // Center the button
      blueButton.style.zIndex = '9999'; // Ensure it's above other elements
      blueButton.onclick = async () => {
        try {
          if ('SpeechRecognition' in window) {
            const recognition = new (window as CustomWindow).SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
              const speechResult = event.results[0][0].transcript;
              const inputField = document.createElement('input');
              inputField.type = 'text';
              inputField.value = speechResult;
              inputField.style.position = 'fixed';
              inputField.style.bottom = '10%'; // Adjust the position as needed
              inputField.style.left = '50%'; // Center horizontally
              inputField.style.transform = 'translateX(-50%)'; // Center the input field
              inputField.style.zIndex = '9999'; // Ensure it's above other elements
              document.body.appendChild(inputField);
            };

            recognition.onerror = (event) => {
              console.error('Speech recognition error:', event.error);
            };

            recognition.start();
          } else {
            console.error('Speech recognition not supported.');
          }
        } catch (error) {
          console.error('Speech recognition error:', error);
        }
      };
      document.body.appendChild(blueButton);
    };
    document.body.appendChild(circleButton);
  });
}
//