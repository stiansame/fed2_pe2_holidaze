/**
 * Links a field's validation message to its input.
 * @param {{id: string, children: string}} props Message ID and text.
 * @returns {import('react').ReactNode}
 */
export default function FieldError({ id, children }) {
  return children ? (
    <span id={id} className="mt-1 block text-small font-normal text-danger">
      {children}
    </span>
  ) : null;
}
