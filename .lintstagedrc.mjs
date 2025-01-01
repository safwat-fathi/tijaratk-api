// const config = {
//   // This will lint and format TypeScript and JavaScript files
//   'src/**/*.(ts|js)': (filenames) => [
//     `yarn eslint --fix ${filenames.join(' ')}`,
//     `yarn prettier --write ${filenames.join(' ')}`,
//   ],
//   // this will Format MarkDown and JSON
//   '**/*.(md|json)': (filenames) =>
//     `yarn prettier --write ${filenames.join(' ')}`,
// };

// export default config;
const config = {
  'src/**/*.(ts|js)': ['yarn eslint --fix', 'yarn prettier --write'],
  '**/*.(md|json)': ['yarn prettier --write'],
};

export default config;
