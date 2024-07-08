import { SocialLinkSchema } from "../data/schema/social-links.schema";
import { envelope } from '../icon/solid.icon'
import { github, instagram, linkedin } from '../icon/brand.icon'
import { faCoffee } from '@fortawesome/free-solid-svg-icons';


const socialLinkData: SocialLinkSchema[] = [
  {
    name: 'Steam',
    icon: faCoffee,
    link: 'https://steamcommunity.com/id/caltox/',
    color: '#c3c3c3',
  },

];

export default socialLinkData;
