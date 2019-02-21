# Mermaid

[Mermaid](https://mermaidjs.github.io/) allows to draw diarams and flowcharts using a Markdown like syntax.

## Usage

You can use [markdown's code blocks](https://help.github.com/en/articles/creating-and-highlighting-code-blocks) to render diagrams by specifying `mermaid` as a lanaguage identifier. Like this...

```mermaidSyntax

```mermaid
 graph TD
  A-->B
  A-->C
``````

Should render as...

```mermaid

  graph TD
  A-->B
  A-->C

```

## Preview in editor

Very convinient if you don't want to preview it in the browser.

[VS Code extension for Mermaid preview](https://marketplace.visualstudio.com/items?itemName=vstirbu.vscode-mermaid-preview)
