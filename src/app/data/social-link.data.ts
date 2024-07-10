import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { SocialLinkSchema } from "../data/schema/social-links.schema";
import { faSteam, faLinkedin, faInstagram} from '@fortawesome/free-brands-svg-icons'


const socialLinkData: SocialLinkSchema[] = [
  {
    name: 'Steam',
    title: 'Steam',
    icon: faSteam,
    link: 'https://steamcommunity.com/id/caltox/',
    color: 'slate-600',
    hover: 'gray-100',
    light: 'slate-600',
  },
  {
    name: 'LinkedIn',
    title: 'LinkedIn',
    icon: faLinkedin,
    link: 'https://linkedin.com/in/dnowinski',
    color: 'blue-600',
    hover: 'gray-100',
    light: 'blue-600',
  },
  {
    name: 'Message',
    title: 'Message',
    icon: faEnvelope,
    link: 'mailto:hello@dnowinski.com?subject=Hello From Your Website!',
    color: 'orange-700',
    hover: 'gray-100',
    light: 'orange-700',
  },
  {
    name: 'Instagram',
    title: 'Instagram',
    icon: faInstagram,
    link: 'https://instagram.com/caltox88',
    color: 'purple-700',
    hover: 'gray-100',
    light: 'purple-700',
  },

];

export default socialLinkData;
