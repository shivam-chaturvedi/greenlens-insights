import re

def update_file(filename, process_func):
    with open(filename, 'r') as f:
        content = f.read()
    new_content = process_func(content)
    if new_content != content:
        with open(filename, 'w') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"No changes made to {filename}")

def add_import(content, import_str):
    if 'import { Skeleton }' in content or 'Skeleton' in import_str and 'import { Skeleton } from "@/components/ui/skeleton"' in content:
        return content
    last_import = content.rfind('import ')
    end_of_imports = content.find('\n', last_import) + 1
    return content[:end_of_imports] + import_str + '\n' + content[end_of_imports:]

def process_articledetail(content):
    if 'ArticleDetailSkeleton' in content: return content
    imports = 'import { Skeleton } from "@/components/ui/skeleton";'
    content = add_import(content, imports)
    
    skeleton_def = """
const ArticleDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto py-12 px-6">
    <Skeleton className="h-4 w-[100px] mb-8" />
    <Skeleton className="w-full aspect-video rounded-xl mb-8" />
    <div className="space-y-4">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
    <div className="mt-12 space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

const CommentSkeleton = () => (
  <div className="flex gap-4 mb-6">
    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-3 w-[60px]" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);
"""
    content = content.replace('const ArticleDetail = () => {', skeleton_def + '\nconst ArticleDetail = () => {')
    
    # Replace article loading
    old_article_loading = """  if (isArticleLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg font-semibold text-muted-foreground">Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }"""
    new_article_loading = """  if (isArticleLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <ArticleDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }"""
    content = content.replace(old_article_loading, new_article_loading)
    
    # Replace comments loading
    old_comments_loading = """              {areCommentsLoading ? (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              )"""
    new_comments_loading = """              {areCommentsLoading ? (
                <div>
                  <CommentSkeleton />
                  <CommentSkeleton />
                </div>
              )"""
    content = content.replace(old_comments_loading, new_comments_loading)
    return content

update_file('src/pages/ArticleDetail.tsx', process_articledetail)

