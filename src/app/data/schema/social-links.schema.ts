import { IconDefinition } from "@fortawesome/angular-fontawesome";

export interface SocialLinkSchema {
  name: string;
  icon: IconDefinition;
  link: string;
  color?: string;
};
