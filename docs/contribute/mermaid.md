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

[VS Code extension for Mermaid preview](https://marketplace.visualstudio.com/items?itemName=vstirbu.vscode-mermaid-preview)

### Special characters
In a sequence diagram some characters don't work with the plugin:

- Use `&lt;` instead of `<`
- Use `&#62;` instead of `>`