import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';

const consoleWidth = 130;

const centerText = (text) => {
  const lines = text.split('\n');
  return lines.map(line => {
    const padding = Math.max(0, Math.floor((consoleWidth - line.length) / 2));
    return ' '.repeat(padding) + line;
  }).join('\n');
};

let isAnimationRunning = false;
let animationPromise = null;
let rainbowDecoration = null;
let welcomeMessage = null;

export const displayWelcomeMessage = async () => {
  console.clear();

  const decoration = centerText('                        𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓽𝓸 𝓽𝓱𝓮 𝓟𝓪𝓽𝓱 𝓕𝓲𝓷𝓭𝓮𝓻 𝓐𝓟𝓘 \n'+
    '\n'+
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' +
    '\n┃                                                                                                           ┃' +
    '\n┃ ██████╗  █████╗ ████████╗██╗  ██╗    ███████╗██╗███╗   ██╗██████╗ ███████╗██████╗      █████╗ ██████╗ ██╗ ┃' +
    '\n┃ ██╔══██╗██╔══██╗╚══██╔══╝██║  ██║    ██╔════╝██║████╗  ██║██╔══██╗██╔════╝██╔══██╗    ██╔══██╗██╔══██╗██║ ┃' +
    '\n┃ ██████╔╝███████║   ██║   ███████║    █████╗  ██║██╔██╗ ██║██║  ██║█████╗  ██████╔╝    ███████║██████╔╝██║ ┃' +
    '\n┃ ██╔═══╝ ██╔══██║   ██║   ██╔══██║    ██╔══╝  ██║██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗    ██╔══██║██╔═══╝ ██║ ┃' +
    '\n┃ ██║     ██║  ██║   ██║   ██║  ██║    ██║     ██║██║ ╚████║██████╔╝███████╗██║  ██║    ██║  ██║██║     ██║ ┃' +
    '\n┃ ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝     ╚═╝ ┃' +
    '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  );

  isAnimationRunning = true;
  rainbowDecoration = chalkAnimation.rainbow(decoration);

  try {
    await Promise.race([
      new Promise(resolve => setTimeout(resolve, 5000)),
      new Promise(resolve => {
        animationPromise = resolve;
      })
    ]);

    if (isAnimationRunning) {
      rainbowDecoration.stop();

      welcomeMessage = chalkAnimation.pulse(
        centerText('Welcome to the Path Finder API!!!!\n' +
        'Thanks for using the Path Finder API!!')
      );

      await Promise.race([
        new Promise(resolve => setTimeout(resolve, 3000)),
        new Promise(resolve => {
          animationPromise = resolve;
        })
      ]);

      if (isAnimationRunning) {
        welcomeMessage.stop();
      }
    }
  } finally {
    isAnimationRunning = false;
    if (animationPromise) {
      animationPromise();
    }
  }
};

export const stopAnimation = () => {
  if (isAnimationRunning) {
    isAnimationRunning = false;
    if (rainbowDecoration) rainbowDecoration.stop();
    if (welcomeMessage) welcomeMessage.stop();
    if (animationPromise) {
      animationPromise();
    }
    console.log(chalk.red(centerText('\n '+'\n Thank you for using the Path Finder API'+
      '\n Carlos G.'
    )));
  }
};