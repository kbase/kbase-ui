import orcidIcon from 'assets/images/ORCID-iD_icon-vector.svg';
import nouserpic from 'assets/images/nouserpic.png';

export type ImageName = 'orcidIcon' | 'nouserpic';

export function image(name: ImageName): string {
    switch (name) {
        case 'orcidIcon': return orcidIcon;
        case 'nouserpic': return nouserpic;
    }
}
