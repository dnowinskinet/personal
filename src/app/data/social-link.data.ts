import { SocialLinkSchema } from "../data/schema/social-links.schema";
import { envelope } from '../icon/solid.icon'
import { github, instagram, linkedin } from '../icon/brand.icon'


const socialLinkData: SocialLinkSchema[] = [
  {
    name: 'Steam',
    path: github,
    link: 'https://steamcommunity.com/id/caltox/',
    color: '#c3c3c3',
  },
  {
    name: 'LinkedIn',
    path: linkedin,
    link: 'https://linkedin.com/in/dnowinski',
    color: '#1469C7',
  },
  {
    name: 'Message',
    path: envelope,
    link: 'mailto:hello@dnowinski.com?subject=Hello From Your Website!',
    color: '#e74c3c',
  },
  {
    name: 'Instagram',
    path: instagram,
    link: 'https://instagram.com/caltox88',
    color: '#E52765',
  },
];

export default socialLinkData;
