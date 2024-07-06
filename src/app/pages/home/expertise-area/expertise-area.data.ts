import { ExpertiseAreaSchema } from "./expertise-area.schema";
import { faHand } from "@fortawesome/free-solid-svg-icons";
import { site, api, mobile, writing, analytics, speak, research, operations, speed, search } from '@icon/regular.icon'


const expertiseAreaData: ExpertiseAreaSchema[] = [
  {
    icon: operations,
    percent: '90%',
    name: 'Operations'
  },
  {
    icon: analytics,
    percent: '90%',
    name: 'Analytics'
  },
  {
    icon: api,
    percent: '70%',
    name: 'Technical Systems'
  },
  {
    icon: writing,
    percent: '80%',
    name: 'Writing/Editing'
  },
  {
    icon: speak,
    percent: '55%',
    name: 'Public Speaking'
  },
  {
    icon: research,
    percent: '60%',
    name: 'Research'
  },
]

export default expertiseAreaData
