import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import bundleRoutes from './bundle.routes';
import activityRoutes from './activity.routes';
import alertRoutes from './alert.routes';
import settingsRoutes from './settings.routes';

const apiRouter = Router();

apiRouter.use(authRoutes);
apiRouter.use(dashboardRoutes);
apiRouter.use(bundleRoutes);
apiRouter.use(activityRoutes);
apiRouter.use(alertRoutes);
apiRouter.use(settingsRoutes);

export default apiRouter;
