---
---
# Adding a new file

1. Determine where in the directory hierarchy the file should reside.
   - The top of the repo is the top of the hierarchy.

2. Update `_config.yml` to add the file to the menu.
   - Each menu entry is an object in a list of other menu entries
   - The only required property is `label`, which serves as the menu display label
   - It is best to only use the label property. it will be converted to a file name by:
      1. lowercasing
      2. replacing spaces with `-`

3. Add the file to the appropriate location with a name corresponding to the menu label, as described above.

4. The file should have the following structure:

    ```markdown
    ---
    ---
    # TITLE
    ```

5. Start or stop and restart the Jekyll server:

   ```bash
   bundler exec jekyll serve --livereload
   ```

6. Confirm that the page is working correctly from the menu

7. Now you may edit the new file