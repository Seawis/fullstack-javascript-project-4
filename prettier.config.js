module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  semi: true,
  htmlWhitespaceSensitivity: 'ignore', // или 'strict' в зависимости от предпочтений
  overrides: [
    {
      files: '*.html',
      options: {
        // можно задать специфичные правила для HTML
      },
    },
  ],
}
