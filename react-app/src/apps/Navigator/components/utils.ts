// as of now eslint cannot detect when imported interfaces are used
import { Location } from 'history'; // eslint-disable-line no-unused-vars

export const keepParamsLinkTo =
  (paramsToKeep: string[], link: string) => (loc: Location) => {
    // normalize /path/to to /path/ and /path/to/ to /path/to/
    // if link begins with something other than ? or #
    const pathnameTrimmed =
      loc.pathname.indexOf('/') > -1
        ? loc.pathname.slice(0, loc.pathname.lastIndexOf('/')) + '/'
        : '';
    const pathSafeCondition =
      loc.pathname[loc.pathname.length - 1] === '/' ||
      '?#'.indexOf(link[0]) > -1;
    const pathnameNormalized = pathSafeCondition
      ? loc.pathname
      : pathnameTrimmed;
    const path = link[0] === '/' ? link : pathnameNormalized + link;
    const extraSlash = path[0] === '/' ? '' : '/';
    const newLink = new URL(window.location.origin + extraSlash + path);
    const locSearchParams = new URLSearchParams(loc.search);
    paramsToKeep.forEach((param) => {
      const value = locSearchParams.get(param);
      if (value !== null) {
        newLink.searchParams.set(param, value);
      }
    });
    return newLink.pathname + newLink.search + newLink.hash;
  };
