import app from './src/app';
import { env } from './src/config/env';

const port = env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
