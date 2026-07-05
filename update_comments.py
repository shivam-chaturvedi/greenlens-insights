import re

with open('src/pages/Community.tsx', 'r') as f:
    content = f.read()

# 1. State
state_vars = """  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>("");
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);"""
content = content.replace(
    '  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);',
    '  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);\n' + state_vars
)

# 2. Handlers
handlers = """
  const handleEditComment = async () => {
    if (!editingCommentId || !editingCommentContent.trim()) return;
    try {
      const { error } = await supabase.from("comments").update({ content: editingCommentContent.trim() }).eq("id", editingCommentId);
      if (error) throw error;
      toast({ title: "Comment updated!" });
      await refreshCommunityPosts();
      setEditingCommentId(null);
      setEditingCommentContent("");
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteComment = async () => {
    if (!deletingCommentId) return;
    setIsDeletingComment(true);
    try {
      const { error } = await supabase.from("comments").delete().eq("id", deletingCommentId);
      if (error) throw error;
      toast({ title: "Comment deleted" });
      await refreshCommunityPosts();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDeletingComment(false);
      setDeletingCommentId(null);
    }
  };
"""
content = content.replace('  const handleAddComment = async (postId: number) => {', handlers + '\n  const handleAddComment = async (postId: number) => {')

# 3. Comment rendering
old_comment_rendering = '<p className="text-foreground/80 leading-relaxed">{comment.content}</p>'
new_comment_rendering = """                                  {editingCommentId === comment.id ? (
                                    <div className="space-y-2 mt-2">
                                      <input
                                        type="text"
                                        value={editingCommentContent}
                                        onChange={(e) => setEditingCommentContent(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleEditComment();
                                          }
                                        }}
                                        className="w-full px-3 py-1.5 bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors rounded-md"
                                      />
                                      <div className="flex justify-end gap-3">
                                        <button onClick={() => setEditingCommentId(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                                        <button onClick={handleEditComment} className="text-xs text-primary font-semibold hover:text-primary/80">Save</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-between gap-4 mt-2">
                                      <p className="text-foreground/80 leading-relaxed flex-1">{comment.content}</p>
                                      {session?.user?.id === comment.userId && (
                                        <div className="flex items-center gap-1 shrink-0 mt-1">
                                          <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }} className="p-1 text-muted-foreground hover:text-primary transition-colors rounded-full" title="Edit comment">
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => setDeletingCommentId(comment.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-full" title="Delete comment">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}"""
content = content.replace(old_comment_rendering, new_comment_rendering)

# 4. Comment deletion modal
old_post_modal = """      <AlertDialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeletePost(); }} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>"""
new_comment_modal = """      <AlertDialog open={!!deletingCommentId} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your comment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingComment}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteComment(); }} disabled={isDeletingComment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeletingComment ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>"""
content = content.replace(old_post_modal, old_post_modal + '\n\n' + new_comment_modal)

with open('src/pages/Community.tsx', 'w') as f:
    f.write(content)

