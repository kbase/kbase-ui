# Step 4. Get the plugin to say "Hello"

Now we need to add enough structure to the plugin to allow it to say "Hello". After that we'll wire it up to kbase-ui so we can see it say "Hello" within the ui.

1. Open a new terminal in the plugin repo directory

    1. You can use VSC's terminal with **``[Ctrl]` ``**

2. Create a react app with typescript support

   ```bash
   npx create-react-app react-app --template typescript
   ```

3. Ensure it is working
   We should perform an out-of-the-box test.

   ```bash
   cd react-app
   npm run start
   ```

   > You may get a message that port 3000 is alreay used. If so, go ahead and let it pick another port.

   A browser should launch, inside of which you should see a slowly spinning React logo.

   Stop the `yarn run start` task by hitting **[Control]C** in the terminal.
   
4. Next let's do a static build to ensure that it is working:

   ```bash
   npm run build
   ```

   A static, or production, build will place all the files needed to run the web app in the `build` directory.

   And now let's run the built-in test:

   ```shell
   npm run test
   ```

   You should see that the single test passes! Press q to quit the tests.

   Next we'll morph this small web app into something more useful by, of all things, making it say "Hello"


5. Now we take control of the app, removing the sample content that the CRA script creates.

6. Load the development server again:

   ```bash
   npm run start
   ```

 The browser should pop up again showing the initial state of the app with the spinning React logo.

- Edit `react-app/src/App.tsx`

  - Replace all of the content between and including the `<header>` tag, with

    ```html
    <p>Hello!</p>
    ```

  - Edit `react-app/src/App.css`

  
  - Remove all of the styles except that for `.App`.
  - Remove the styles from `.App`.

- Remove the files:
  
  - `react-app/logo.svg`
  - `react-app/public/logo192.png`
  - `react-app/public/logo512.png`
  - `react-app/public/favicon.ico`
  - `react-app/public/manifest.json`
  - `react-app/public/robots.txt`
  
- A quick test

  The app has a single unit test pre-configured for the App component. 

  Quit the web app, and run the test script to confirm that the test passes.

  ```bash
  npm run test
  ```

  Ah, it doesn't pass! That is because we changed the App.tsx.

   You should have noticed that the test script did not return to the command line. The default mode for testing is to re-test whenever any code file is changed.

- Fix the test:
    - Open the test file `App.test.tsx`
    - Change the line

    ```jsx
    const linkElement = getByText(/learn react/i);
    ```

    to

     ```jsx
    const linkElement = getByText(/Hello!/i);
     ```

- The test should automatically run again, and this time pass.

    Stop the test by pressing `q` in the terminal window.

## Next Step

[Step 5. A Quick Refactor](./5-a-quick-refactor)

\---
