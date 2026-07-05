import re

with open('src/pages/Community.tsx', 'r') as f:
    content = f.read()

modal_code = """
      <AlertDialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
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
"""

# Find where to inject the modal. Right before the outermost </div> of the component, which is before `<Footer />` probably.
# Wait, let's just insert it before `export default Community;`
# Actually, the modal needs to be inside the component return statement or inside the component body, typically just before the last `</div>` or alongside `<Footer />`.

content = content.replace(
    '      <Footer />\n    </div>\n  );\n};',
    '      <Footer />\n' + modal_code + '\n    </div>\n  );\n};'
)

with open('src/pages/Community.tsx', 'w') as f:
    f.write(content)

