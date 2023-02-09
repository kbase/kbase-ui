# Step 5. A Quick Refactor

In this step we refactor the App component to align with the uniform way we prefer to create React components.

The `App` component installed by the Create React App (CRA) tool follows the functional model of component programming. This approach is gaining popularity, and in recent releases (as of June 2019) the React team is promoting it as the default form. However, there is some debate about this in the React community, and we are not, as of now, adopting this pattern.

> Note to developer -- it has been four years -- if you do use functional components, you can evaluate the rest of this document in that light.

Rather, we follow the class-based component programming model.

The primary reasons are:

- the function component model has only recently received support to place it on a parity with class components
  - it is thus not widely known or documented
- to keep codebases as understandable as possible by the most number of developers, we prefer to support the least number of programming patterns.
- the class-based component model works well with Typescript
- functional compnents require third party support to achieve functional parity with class components.
- less refactoring work if a component needs to utilize component lifecycle methods

So, let's refactor `App.tsx`:

1. Ensure that the tests are running. When doing refactoring, it is not a bad idea to have the test runner continuously running.

    ```bash
    yarn test
    ```

2. Edit `react-app/src/App.tsx`

3. Replace

   ```typescript
   const App: React.FC = () => {
     return (
       <div className="App">
         <p>Hello!</p>
       </div>
     );
   };

   export default App;
   ```

4. With:

   ```typescript
   import { Component } from 'react';
   
   export interface AppProps { }
   
   interface AppState { }
   
   export default class App extends Component<AppProps, AppState> {
       render() {
           return (
               <div className="App">
                   <p>Hello!</p>
               </div>
           );
       }
   }
   ```

5. After saving the changes, the test runner should show success.

## Next Step

[Step 6. Setup as Plugin](./6-setup-as-plugin)

\---
