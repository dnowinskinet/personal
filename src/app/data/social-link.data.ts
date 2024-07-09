import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { SocialLinkSchema } from "../data/schema/social-links.schema";
import { faSteam, faLinkedin, faInstagram} from '@fortawesome/free-brands-svg-icons'


const socialLinkData: SocialLinkSchema[] = [
  {
    name: 'Steam',
    title: 'Steam',
    icon: faSteam,
    link: 'https://steamcommunity.com/id/caltox/',
    color: '#c3c3c3',
    hover: 'gray-100',
    light: 'slate-600',
  },
  {
    name: 'LinkedIn',
    title: 'LinkedIn',
    icon: faLinkedin,
    link: 'https://linkedin.com/in/dnowinski',
    color: '#1469C7',
    hover: 'gray-100',
    light: 'blue-600',
  },
  {
    name: 'Message',
    title: 'Message',
    icon: faEnvelope,
    link: 'mailto:hello@dnowinski.com?subject=Hello From Your Website!',
    color: 'gray-100',
    hover: 'gray-100',
    light: 'orange-700',
  },
  {
    name: 'Instagram',
    title: 'Instagram',
    icon: faInstagram,
    link: 'https://instagram.com/caltox88',
    color: '#E52765',
    hover: 'gray-100',
    light: 'purple-700',
  },

];

export default socialLinkData;
