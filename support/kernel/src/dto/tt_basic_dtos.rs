pub struct RbumBasicFilterReq {
    pub ignore_scope: bool,
    pub rel_ctx_owner: bool,

    pub ids: Option<Vec<String>>,
    pub name: Option<String>,
    pub names: Option<Vec<String>>,
}