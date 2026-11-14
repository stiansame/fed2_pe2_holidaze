import { useEffect } from 'react';

/**
 * Updates the browser tab title without rendering page content.
 * @param {object} props Component props.
 * @param {string} props.children Page title.
 * @returns {null}
 */
export default function DocumentTitle({ children }) {
  useEffect(() => { document.title = children; }, [children]);
  return null;
}
