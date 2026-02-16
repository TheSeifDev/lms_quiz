import { useEffect } from 'react';

/**
 * Custom hook to disable browser inspection tools
 * Prevents right-click and common DevTools keyboard shortcuts
 * to discourage cheating during online exams
 */
export function useDisableInspect() {
    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Disable common inspection keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12 - DevTools
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+I - Inspect Element
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+J - Console
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+C - Element Picker
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }

            // Ctrl+U - View Source
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }

            // Cmd+Option+I (Mac)
            if (e.metaKey && e.altKey && e.key === 'i') {
                e.preventDefault();
                return false;
            }

            // Cmd+Option+J (Mac)
            if (e.metaKey && e.altKey && e.key === 'j') {
                e.preventDefault();
                return false;
            }

            // Cmd+Option+C (Mac)
            if (e.metaKey && e.altKey && e.key === 'c') {
                e.preventDefault();
                return false;
            }
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup on unmount
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
}
