# AsciiDoc to DocBook Conversion Rules

Your task is to convert an AsciiDoc document (or a selection from it) into a valid DocBook XML document. During the conversion, please adhere strictly to the following rules:

### General Conversion Rules

1.  **Admonitions**:
    *   Convert AsciiDoc `CAUTION` blocks to DocBook `<important>` elements. Do not use `<caution>`.

2.  **Sidebars**:
    *   When encountering a `sidebar` block in AsciiDoc, remove the `<sidebar>` tags but retain all the content within it.

3.  **Lists**:
    *   Convert ordered (numbered) lists into `<procedure>` elements. Each list item should be converted to a `<step>`.

4.  **Tables**:
    *   Ensure every `<table>` element has a `<title>`. If the source table lacks a title, generate a concise and descriptive one based on the table's content.

### Text and Formatting Rules

5.  **Titles**:
    *   Apply sentence-case capitalization to all titles (e.g., in `<title>` elements). Only the first letter of the first word and any proper nouns should be capitalized.

6.  **Contractions**:
    *   Expand common English contractions into their full form. For example, "don't" becomes "do not", "they've" becomes "they have", and "it's" becomes "it is".

7.  **Inline Elements**:
    *   **File Names**: Enclose all file paths and names in `<filename>` tags (e.g., `<filename>/etc/fstab</filename>`). This rule should not be applied to text already inside a `<screen>` element.
    *   **System Services**: Enclose names of system services or daemons with the `<systemitem class="daemon">` tag (e.g., `<systemitem class="daemon">sshd</systemitem>`).
    *   **Variables**: Represent variables (typically uppercase text) using the `<replaceable>` tag. This applies if the variable was previously inside `<literal>` tags or enclosed in angle brackets (`< >`).
    *   **Computer Output**: Replace any `<computeroutput>` tags with `<literal>` tags.

### Code and Command Blocks

8.  **Code Blocks**:
    *   Use the `<screen>` element instead of `<programlisting>` for all code blocks.
    *   Do not include the source language attribute (e.g., `language="python"`) in the resulting `<screen>` tag.
    *   For blocks containing shell commands, insert the `&prompt;user;` entity immediately after the opening `<screen>` tag.

### Structure and Referencing

9.  **IDs**:
    *   Generate a descriptive `xml:id` for each major block element (such as sections, procedures, and tables).
    *   These IDs should be hierarchical and derived from the `xml:id` of the parent topic. For example, a section within a topic with `xml:id="topic-main"` could have an ID like `xml:id="topic-main-section-install"`.

10. **Cross-References**:
    *   Use `<xref linkend="..."/>` for all internal links that point to an `xml:id` within the document. Do not use the `<link>` element for this purpose.
