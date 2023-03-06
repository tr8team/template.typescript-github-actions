import { GithubActionLogger } from "../../../../src/external/github-action-logger.js";

const logger = new GithubActionLogger();

logger.debug("H is Hydrogen with atomic number 1");
logger.notice("He is Helium with atomic number 2");
logger.info("Li is Lithium with atomic number 3");
logger.warning("Be is Beryllium with atomic number 4");
logger.error("B is Boron with atomic number 5");
