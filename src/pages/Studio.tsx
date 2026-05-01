/**
 * /studio/:id — every studio renders through this single page.
 *
 * The studio definition is looked up from the registry; the StudioShell
 * does all the heavy lifting (input rendering, run queue, output gallery).
 */
import { useParams, Navigate } from 'react-router-dom';
import StudioShell from '../components/studio/StudioShell';
import { STUDIO_BY_ID } from '../lib/studios/registry';
import type { StudioId } from '../lib/studios/types';

export default function Studio() {
  const { id } = useParams<{ id: string }>();
  const studio = STUDIO_BY_ID[id as StudioId];

  if (!studio) {
    return <Navigate to="/studios" replace />;
  }

  return <StudioShell studio={studio} />;
}
