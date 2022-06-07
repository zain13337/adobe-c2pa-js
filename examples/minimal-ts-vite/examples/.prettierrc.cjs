module.exports = {
  ...require('../../../.prettierrc.cjs'),
  overrides: [
    {
      files: '**/*.ts',
      options: {
        printWidth: 65,
      },
    },
  ],
};
