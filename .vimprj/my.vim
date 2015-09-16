
" detect path to .vimprj folder
let s:sVimprjPath = expand('<sfile>:p:h')

let g:proj_project_filename=s:sVimprjPath.'/.vimprojects'

let &tabstop = 2
let &shiftwidth = 2

let g:indexer_disableCtagsWarning = 1

let g:indexer_ctagsDontSpecifyFilesIfPossible = 1

" specify .indexer_files to use for Indexer
let g:indexer_indexerListFilename = s:sVimprjPath.'/.indexer_files'

" ignore third party in ffs and easygreap
call add(g:FFS_ignore_list, 'node_modules')
call add(g:FFS_ignore_list, 'bower_components')
let EasyGrepFilesToExclude = "node_modules,bower_components"


let s:sProjectPath = simplify(s:sVimprjPath.'/..')
let g:vimwiki_list[0] =
         \  {
         \     'maxhi': 0,
         \     'css_name': 'style.css',
         \     'auto_export': 0,
         \     'diary_index': 'diary',
         \     'template_default': '',
         \     'nested_syntaxes': {},
         \     'diary_sort': 'desc',
         \     'path': s:sProjectPath.'/stuff/vimwiki/',
         \     'diary_link_fmt': '%Y-%m-%d',
         \     'template_ext': '',
         \     'syntax': 'default',
         \     'custom_wiki2html': '',
         \     'index': 'index',
         \     'diary_header': 'Diary',
         \     'ext': '.wiki',
         \     'path_html': '',
         \     'temp': 0,
         \     'template_path': '',
         \     'list_margin': -1,
         \     'diary_rel_path': 'diary/'
         \  }

