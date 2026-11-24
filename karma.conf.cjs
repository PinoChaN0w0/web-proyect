// Karma + Jasmine + Webpack/Babel (JSX) con cobertura Istanbul.
const webpack = require("webpack");
const fs = require("fs");

// Si no hay CHROME_BIN, buscar Chrome (o Edge, que también sirve) en rutas típicas.
if (!process.env.CHROME_BIN) {
  const e = process.env;
  const candidatos = [
    `${e["PROGRAMFILES"]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${e["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${e["LOCALAPPDATA"]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${e["PROGRAMFILES(X86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
    `${e["PROGRAMFILES"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const encontrado = candidatos.find((p) => fs.existsSync(p));
  if (encontrado) process.env.CHROME_BIN = encontrado;
  else console.warn("No se encontró Chrome/Edge. Define CHROME_BIN con la ruta del .exe");
}

module.exports = function (config) {
  const specs = ["src/**/*.spec.js", "src/**/*.spec.jsx"]; // sin llaves {} (fallan en Windows)
  const preprocessors = {};
  specs.forEach((s) => (preprocessors[s] = ["webpack"]));

  config.set({
    basePath: __dirname,
    frameworks: ["jasmine", "webpack"],
    plugins: ["karma-jasmine", "karma-webpack", "karma-chrome-launcher", "karma-coverage"],
    files: specs.map((pattern) => ({ pattern, watched: false })),
    preprocessors,

    webpack: {
      mode: "development",
      devtool: false,
      resolve: { extensions: [".js", ".jsx"] },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }]],
                // Instrumenta el código fuente (no los .spec) para la cobertura
                plugins: [["istanbul", { exclude: ["**/*.spec.*"] }]],
              },
            },
          },
        ],
      },
      plugins: [
        // Vite usa import.meta.env; aquí lo simulamos
        new webpack.DefinePlugin({ "import.meta.env": JSON.stringify({ BASE_URL: "/" }) }),
      ],
    },

    reporters: ["progress", "coverage"],
    coverageReporter: {
      dir: "coverage-karma",
      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" },
        { type: "lcovonly", subdir: "." },
      ],
      check: { global: { statements: 60, branches: 60, functions: 60, lines: 60 } },
    },

    browsers: ["ChromeHeadlessCI"],
    customLaunchers: { ChromeHeadlessCI: { base: "ChromeHeadless", flags: ["--no-sandbox"] } },
    singleRun: true,
  });
};
