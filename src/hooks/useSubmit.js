import { useRef, useState } from "react";

/**
 * Runs one save action at a time and exposes pending state and errors.
 * @template T
 * @param {(value: T) => Promise<void>} save Form or button action.
 * @returns {{submit: Function, run: Function, pending: boolean, error: string, setError: Function, busy: {current: boolean}}}
 */
export default function useSubmit(save) {
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  /**
   * Locks the action synchronously and releases it after each attempt.
   * @param {T} [value] Input passed to the save action.
   * @returns {Promise<void>}
   */
  async function run(value) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      await save(value);
    } catch (error) {
      setError(error.message);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  /**
   * Prevents native submission and runs the save action with the form.
   * @param {import('react').SubmitEvent<HTMLFormElement>} event Form submission.
   * @returns {Promise<void>}
   */
  function submit(event) {
    event.preventDefault();
    return run(event.currentTarget);
  }

  return { submit, run, pending, error, setError, busy };
}
