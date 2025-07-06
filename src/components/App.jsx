import {AppProvider} from './AppProvider';
import {DailyTodoApp} from './DailyTodoApp';

export const App = () => {
  return (
    <AppProvider>
      <DailyTodoApp />
    </AppProvider>
  );
};

export default App;