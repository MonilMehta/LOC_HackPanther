import {Router} from 'express';
import scrapeMostWanted from '../scrape.cjs';

const router = Router();

router.route("/wantedList").get(scrapeMostWanted);

export default router