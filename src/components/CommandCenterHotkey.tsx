/**
 * Cmd+Shift+C / Ctrl+Shift+C from anywhere in the app jumps to /command.
 *
 * Mounted once near the App root. Silent unless triggered. Only renders
 * the navigation side-effect — the access gate lives on /command itself.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandCenterHotkey() {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't fire while user is typing
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
      const wantsModifier = isMac ? e.metaKey : e.ctrlKey;

      if (wantsModifier && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        navigate('/command');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  return null;
}
