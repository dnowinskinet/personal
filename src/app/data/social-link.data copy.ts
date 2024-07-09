import { SocialLinkSchema } from "../data/schema/social-links.schema";
import { faSteam, faLinkedin, faInstagram} from '@fortawesome/free-brands-svg-icons'


const socialLinkData: SocialLinkSchema[] = [
  {
    name: 'Steam',
    title: 'wpexplorer',
    link: 'https://steamcommunity.com/id/caltox/',
    color: '#c3c3c3',
  },
  {
    name: 'LinkedIn',
    title: 'faLinkedin',
    link: 'https://linkedin.com/in/dnowinski',
    color: '#1469C7',
  },
  {
    name: 'Message',
    title: 'faEnvelope',
    link: 'mailto:hello@dnowinski.com?subject=Hello From Your Website!',
    color: '#e74c3c',
  },
  {
    name: 'Instagram',
    title: 'faInstagram',
    link: 'https://instagram.com/caltox88',
    color: '#E52765',
  },

];

export default socialLinkData;
