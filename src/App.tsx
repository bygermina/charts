import { Charts } from './charts/charts';
import CodeBackground from './components/basic/code-background/code-background';

import styles from './index.module.scss';

function App() {
  return (
    <div className={styles.root}>
      <CodeBackground className={styles.codeBackground} />
      <Charts />
    </div>
  );
}

export default App;
