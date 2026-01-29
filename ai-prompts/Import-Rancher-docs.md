# Rancher Documentation Import Rules for SUSE Style Guide

These instructions ensure that AsciiDoc documentation imported from Rancher projects adheres to the SUSE Style Guide.

### Word Replacements

Replace the following words with their equivalents, unless they are part of a file name, command, or verbatim block. This rule applies to both singular and plural forms.

*   `hostname` with `host name`
*   `config` with `configuration`

### Cross-Reference Conversion

Convert `xref:` calls that point to a relative path into external `link:` calls.

*   Derive the new URL by appending the relative path to the base URL found in the file's top comment.
*   Replace the `.adoc` file extension with `.html`.

### Product Entity Replacement

*   Replace the generic `{product-name}` entity with the specific product entity mentioned in the comment at the top of the file (e.g., `{rke2}` or `{ranchermanager}`).
*   Replace the following attributes with equivalents:
    - {rke2-product-name} -> {rke2}
    - {k3s-product-name} -> {k3s}
*   Match cross references that start with underline such as '_features_for_all_registered_clusters' with the right section by its name and prepend the section with corresponding ID such as [#_features_for_all_registered_clusters]