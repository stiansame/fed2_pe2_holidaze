import { useEffect } from 'react';

export default function DocumentTitle({ children }) {
  useEffect(() => { document.title = children; }, [children]);
  return null;
}
