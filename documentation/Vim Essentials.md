# Vim Essentials

Basically with vim, you can do everything without touching your mouse. All inputs are from your keyboard and they're from "optimal/convenient" positions.

To be honest, you might be able to get away with not using vim for this project. There are other tools/editors like `nano`. 

## **Modes in Vim**

To achieve some crazy shortcuts to make life easier (kind of something you understand as you use it), vim has "modes". As soon as you open a file, you are NOT in the editing mode. 

   *  Normal Mode (default mode): Navigate and edit text.
   *  Insert Mode: Enter text. Press `i` to start inserting before the cursor or `a` to append after the cursor.
   *  Visual Mode: Select text with `v` (character-wise), `shift-v` (line-wise), or `ctrl-v` (block/column-wise).
   *  Command Mode: Execute commands starting with `:` (e.g., :w to save).

### **File Explorer and Viewing Files** 
If you want to navigate a directory with vim, try  `vim .` - this opens Vim's file explorer and you can navigate different files and directories with the arrow keys and enter key.

If you navigate to a file, and want to quit the file, you have two options. You can either quit back to the command line using `:q` (you might need to press `esc` first). Or you can type `:E` to take you back to vim's file explorer. 

### **Editing Basics**

    i: Insert before the cursor.
    a: Insert after the cursor.
    o: Open a new line below and enter Insert Mode.
    dd: Delete a line.
    x: Delete a character.
    u: Undo the last change.
    Ctrl-r: Redo.

###  **Saving and Quitting**

    :w – Save.
    :w filename – Save as a new file.
    :q! – Quit without saving.
    :wq or ZZ – Save and quit.

###  **Copy, Cut, and Paste**

    yy: Yank (copy) a line.
    p: Paste after the cursor.
    dd: Cut a line.
    yw: Yank (copy) a word.
