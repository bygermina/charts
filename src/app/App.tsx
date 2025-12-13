import { Charts } from '@/pages/charts-page';
import { CodeBackground } from '@/widgets/code-background';

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
