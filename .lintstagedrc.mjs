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
  'src/**/*.(ts|js)': ['pnpm eslint --fix', 'pnpm prettier --write'],
  '**/*.(md|json)': ['pnpm prettier --write'],
};

export default config;
