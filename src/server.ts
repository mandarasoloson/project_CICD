import { app } from './app';
import { Logger } from './utils/logger';

const PORT = process.env.PORT || 3000;
const logger = Logger.getInstance();

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});