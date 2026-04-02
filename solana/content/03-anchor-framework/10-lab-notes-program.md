# Lab: Notes Program

Build a CRUD application for notes. This ties together everything from this module.

## What You'll Build

- `create_note` -- create a note with a title and content
- `update_note` -- modify the content of an existing note
- `delete_note` -- close the note account and recover rent

## The Program

```rust
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod notes {
    use super::*;

    pub fn create_note(
        ctx: Context<CreateNote>,
        note_id: u64,
        title: String,
        content: String,
    ) -> Result<()> {
        require!(title.len() <= Note::MAX_TITLE_LEN, NoteError::TitleTooLong);
        require!(content.len() <= Note::MAX_CONTENT_LEN, NoteError::ContentTooLong);

        let note = &mut ctx.accounts.note;
        note.author = ctx.accounts.author.key();
        note.id = note_id;
        note.title = title;
        note.content = content;
        note.created_at = Clock::get()?.unix_timestamp;
        note.updated_at = note.created_at;
        note.bump = ctx.bumps.note;

        emit!(NoteCreated {
            author: note.author,
            note_id,
            title: note.title.clone(),
        });

        Ok(())
    }

    pub fn update_note(
        ctx: Context<UpdateNote>,
        title: String,
        content: String,
    ) -> Result<()> {
        require!(title.len() <= Note::MAX_TITLE_LEN, NoteError::TitleTooLong);
        require!(content.len() <= Note::MAX_CONTENT_LEN, NoteError::ContentTooLong);

        let note = &mut ctx.accounts.note;
        note.title = title;
        note.content = content;
        note.updated_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn delete_note(_ctx: Context<DeleteNote>) -> Result<()> {
        msg!("Note deleted, rent returned to author");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(note_id: u64)]
pub struct CreateNote<'info> {
    #[account(mut)]
    pub author: Signer<'info>,

    #[account(
        init,
        payer = author,
        space = 8 + Note::SPACE,
        seeds = [b"note", author.key().as_ref(), &note_id.to_le_bytes()],
        bump,
    )]
    pub note: Account<'info, Note>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateNote<'info> {
    pub author: Signer<'info>,

    #[account(
        mut,
        has_one = author,
        seeds = [b"note", author.key().as_ref(), &note.id.to_le_bytes()],
        bump = note.bump,
    )]
    pub note: Account<'info, Note>,
}

#[derive(Accounts)]
pub struct DeleteNote<'info> {
    #[account(mut)]
    pub author: Signer<'info>,

    #[account(
        mut,
        close = author,
        has_one = author,
        seeds = [b"note", author.key().as_ref(), &note.id.to_le_bytes()],
        bump = note.bump,
    )]
    pub note: Account<'info, Note>,
}

#[account]
pub struct Note {
    pub author: Pubkey,     // 32
    pub id: u64,            // 8
    pub title: String,      // 4 + MAX_TITLE_LEN
    pub content: String,    // 4 + MAX_CONTENT_LEN
    pub created_at: i64,    // 8
    pub updated_at: i64,    // 8
    pub bump: u8,           // 1
}

impl Note {
    pub const MAX_TITLE_LEN: usize = 64;
    pub const MAX_CONTENT_LEN: usize = 512;
    pub const SPACE: usize = 32 + 8 + (4 + Self::MAX_TITLE_LEN) + (4 + Self::MAX_CONTENT_LEN) + 8 + 8 + 1;
}

#[error_code]
pub enum NoteError {
    #[msg("Title must be 64 characters or less")]
    TitleTooLong,

    #[msg("Content must be 512 characters or less")]
    ContentTooLong,
}

#[event]
pub struct NoteCreated {
    pub author: Pubkey,
    pub note_id: u64,
    pub title: String,
}
```

## Key Patterns Demonstrated

### Multiple PDAs per User

Using `note_id` in seeds allows each user to create multiple notes:

```rust
seeds = [b"note", author.key().as_ref(), &note_id.to_le_bytes()]
```

### `#[instruction]` for Seed Access

The `CreateNote` struct uses `#[instruction(note_id: u64)]` to access the instruction parameter in seeds.

### `close` Constraint

`close = author` on `DeleteNote` automatically:
1. Zeroes out the account data
2. Transfers remaining lamports to `author`
3. The account is effectively deleted

### Input Validation

Length checks prevent users from exceeding the allocated space:

```rust
require!(title.len() <= Note::MAX_TITLE_LEN, NoteError::TitleTooLong);
```

## Exercise

Write a full test suite that:

1. Creates 3 notes for the same user (IDs 0, 1, 2)
2. Updates note 1's content
3. Deletes note 0
4. Verifies the author balance increased after deletion (rent returned)
5. Tries to create a note with a title longer than 64 chars (should fail)
6. Tries to update another user's note (should fail)

---

**Key Takeaways**
- Use sequential IDs in PDA seeds for multiple accounts per user
- `#[instruction(...)]` gives account structs access to instruction parameters
- `close = target` handles account deletion and rent recovery
- Always validate string lengths against your allocated space
- Events help off-chain systems track activity

**Next:** [Module 04 - SPL Token-2022](../04-spl-token-2022/)
