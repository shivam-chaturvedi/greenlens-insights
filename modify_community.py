import re

with open('src/pages/Community.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import {\n  MessageSquare,\n  ThumbsUp,\n  PenLine,\n  Plus,\n  X,\n  Sparkles,\n  Link as LinkIcon,\n} from "lucide-react";',
    'import {\n  MessageSquare,\n  ThumbsUp,\n  PenLine,\n  Plus,\n  X,\n  Sparkles,\n  Link as LinkIcon,\n  Edit,\n  Trash2,\n} from "lucide-react";\nimport {\n  AlertDialog,\n  AlertDialogAction,\n  AlertDialogCancel,\n  AlertDialogContent,\n  AlertDialogDescription,\n  AlertDialogFooter,\n  AlertDialogHeader,\n  AlertDialogTitle,\n} from "@/components/ui/alert-dialog";'
)

# 2. State variables
state_vars = """  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);"""
content = content.replace(
    '  const [isCreatingPost, setIsCreatingPost] = useState(false);',
    state_vars
)

# 3. Modify handleCreatePost to handleSavePost logic
old_insert = """      const { error } = await supabase.from("posts").insert([payload]);
      if (error) {
        toast({ title: "Post failed", description: error.message, variant: "destructive" });
        return;
      }"""
new_save = """      let error;
      if (editingPostId) {
        const { error: updateError } = await supabase.from("posts").update(payload).eq("id", editingPostId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("posts").insert([payload]);
        error = insertError;
      }
      
      if (error) {
        toast({ title: editingPostId ? "Update failed" : "Post failed", description: error.message, variant: "destructive" });
        return;
      }"""
content = content.replace(old_insert, new_save)

# Reset state
content = content.replace(
    '      setIsCreatingPost(false);',
    '      setIsCreatingPost(false);\n      setEditingPostId(null);'
)

# Edit post handler
handlers = """  const handleEditPost = (post: CommunityPost) => {
    setNewTitle(post.title);
    setNewContent(post.content);
    setNewCategory(post.category);
    setNewTags(post.tags || []);
    setNewDirectData(post.hasDirectData);
    setEditingPostId(post.id);
    setIsCreatingPost(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePost = async () => {
    if (!deletingPostId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("posts").delete().eq("id", deletingPostId);
      if (error) {
        toast({ title: "Delete failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Post deleted", description: "Your post has been removed." });
      await refreshCommunityPosts();
    } finally {
      setIsDeleting(false);
      setDeletingPostId(null);
    }
  };"""
content = content.replace('  const handleCreatePost = async (event: React.FormEvent) => {', handlers + '\n\n  const handleCreatePost = async (event: React.FormEvent) => {')

# Buttons in the UI
old_post_header = """                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatRelativeTime(post.createdAt)}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border border-border">
                            {post.uploadType}
                          </span>
                        </div>"""
new_post_header = """                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatRelativeTime(post.createdAt)}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border border-border">
                            {post.uploadType}
                          </span>
                          {session?.user.id === post.userId && (
                            <div className="flex items-center gap-1 ml-2">
                              <button onClick={() => handleEditPost(post)} className="p-1 hover:text-primary transition-colors rounded-full" title="Edit post">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeletingPostId(post.id)} className="p-1 hover:text-destructive transition-colors rounded-full" title="Delete post">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>"""
content = content.replace(old_post_header, new_post_header)

# Create post title
content = content.replace(
    '<h2 className="text-xl font-bold font-display">Create a new post</h2>',
    '<h2 className="text-xl font-bold font-display">{editingPostId ? "Edit post" : "Create a new post"}</h2>'
)

# Button text
content = content.replace(
    '{isSubmittingPost ? "Publishing…" : "Publish Post"}',
    '{isSubmittingPost ? "Publishing…" : editingPostId ? "Save Changes" : "Publish Post"}'
)

cancel_post = """                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingPost(false);
                      setEditingPostId(null);
                    }}"""
content = re.sub(r'<button\s*type="button"\s*onClick=\{\(\) => setIsCreatingPost\(false\)\}', cancel_post, content)

# Modal component at the end of return
modal_code = """      <AlertDialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
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
      </AlertDialog>
    </div>
  );
};"""
content = re.sub(r'    </div>\s*<Footer />\s*</div>\s*\);\s*};\s*export default Community;', '    </div>\n      <Footer />\n' + modal_code + '\n\nexport default Community;', content)

with open('src/pages/Community.tsx', 'w') as f:
    f.write(content)

