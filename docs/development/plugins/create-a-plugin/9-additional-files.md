# Step 19. Additional Files

We need to add two more files to round out the repo.

1. Add license file

    Create the file `LICENSE.md` at the top level of your repo, with the following content:

    ```markdown
    Copyright (c) 2023 The KBase Project and its Contributors

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    ```

2. Update the `README.md` file

    Although we created a README.md file when the repo was created at github, we need to superseded that one with something more substantial.

    Our template is based on  [common-readme](https://github.com/noffle/common-readme) with some minor modifications.

    - **Title** as the first level header
    - **One line description** as quoted text
    - **Longer description**
    - All sections below as second level header
    - **Usage**: describe how to use it
    - **Background**: (recommended) the plugin is probably the front end for an area of complex of KBase functionality, which should be the subject of the background.
    - **Install**: (optional) if the repo has some installation aspect, describe or reference it here
    - **Acknowledgements**: a list of major contributors to code, architectural design, and so forth; (optional) link to their GitHub profile or other home page.
    - **See Also**: a list of related projects, linked.
    - **License**: Will always be "SEE LICENSE IN LICENSE", since the KBase open source license is contained within the separate LICENSE file.

    Copy the following sample into `README.md` and complete each relevant section. Unnecessary sections may be removed.

    ```markdown
        # TITLE
        
        > SINGLE SENTENCE
        
        BRIEF DESCRIPTION
        
        ## Usage
        
        HOW TO GET STARTED and USE IT
        
        ## Install
        
        INSTALLATION OF DEPENDENCIES, THE THING ITSELF
        
        ## Background
        
        HOW THIS FITS INTO KBASE
        
        ## Acknowledgments
        
        - NAME - COMMENT
        
        ## See Also
        
        - [TITLE](URL)
        
        ## License
        
        SEE LICENSE IN LICENSE.md
        ```
    
        - Refs
        - [Awesome README](https://github.com/matiassingers/awesome-readme) 
            - collection links to examples, specs, articles, tools.
        
    - Tooling
            - [common-readme](https://github.com/noffle/common-readme) - an effort to, er, create a standard readme
        
        ```markdown
    ```

## References

- [abc](abc)

## Next Step

[Step 10. Push to Repo](./10-push-to-repo)

\---
