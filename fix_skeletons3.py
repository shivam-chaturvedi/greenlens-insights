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

def process_admin(content):
    if 'AdminReportSkeleton' in content: return content
    imports = 'import { Skeleton } from "@/components/ui/skeleton";'
    content = add_import(content, imports)
    
    skeleton_def = """
const AdminReportSkeleton = () => (
  <div className="rounded-3xl border border-border bg-card p-6 flex justify-between items-center space-y-0">
    <div className="space-y-2">
      <Skeleton className="h-5 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

const AdminArticleSkeleton = () => (
  <div className="rounded-3xl border border-border bg-card p-6 flex justify-between items-center space-y-0">
    <div className="space-y-2 flex-1">
      <Skeleton className="h-5 w-[250px]" />
      <Skeleton className="h-4 w-[180px]" />
      <Skeleton className="h-3 w-[100px] mt-2" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);
"""
    content = content.replace('const AdminPanel = () => {', skeleton_def + '\nconst AdminPanel = () => {')
    
    old_reports_loading = """            {isLoading && (
              <div className="rounded-3xl border border-border bg-muted p-6 text-sm text-muted-foreground">Loading reports ...</div>
            )}"""
    new_reports_loading = """            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <AdminReportSkeleton key={i} />)}
              </div>
            )}"""
    content = content.replace(old_reports_loading, new_reports_loading)
    
    old_articles_loading = """              {isLoading ? (
                <div className="rounded-3xl border border-border bg-muted p-6 text-sm text-muted-foreground">
                    Loading articles...
                </div>
              )"""
    new_articles_loading = """              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <AdminArticleSkeleton key={i} />)}
                </div>
              )"""
    content = content.replace(old_articles_loading, new_articles_loading)

    old_modal_loading = """              {isModalLoadingArticle ? (
                <div className="py-10 text-center text-muted-foreground">Loading article...</div>
              )"""
    new_modal_loading = """              {isModalLoadingArticle ? (
                <div className="space-y-4 py-6">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-4 w-1/4 mb-8" />
                  <Skeleton className="w-full aspect-video rounded-xl mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )"""
    content = content.replace(old_modal_loading, new_modal_loading)

    return content

update_file('src/pages/AdminPanel.tsx', process_admin)

