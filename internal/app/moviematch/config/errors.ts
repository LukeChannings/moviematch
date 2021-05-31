import { MovieMatchError } from "/internal/app/moviematch/util/assert.ts";

export class ConfigFileNotFoundError extends MovieMatchError {}
export class InvalidConfigurationError extends MovieMatchError {}
export class ConfigReloadError extends MovieMatchError {}

export class ConfigMustBeRecord extends MovieMatchError {}
export class HostNameMustBeString extends MovieMatchError {}
export class PortMustBeNumber extends MovieMatchError {}
export class LogLevelInvalid extends MovieMatchError {}
export class ServersMustBeArray extends MovieMatchError {}
export class ServersMustNotBeEmpty extends MovieMatchError {}
export class ServerMustBeRecord extends MovieMatchError {}
export class ServerUrlMustBeString extends MovieMatchError {}
export class ServerUrlInvalid extends MovieMatchError {}
export class ServerTokenMustBeString extends MovieMatchError {}
export class ServerLibraryTitleFilterInvalid extends MovieMatchError {}
export class ServerLibraryTypeFilterInvalid extends MovieMatchError {}
export class ServerBasePathInvalid extends MovieMatchError {}
export class ServerLinkTypeInvalid extends MovieMatchError {}
export class BasicAuthInvalid extends MovieMatchError {}
export class BasicAuthUserNameInvalid extends MovieMatchError {}
export class BasicAuthPasswordInvalid extends MovieMatchError {}

export class PermittedAuthTypesInvalid extends MovieMatchError {}
export class PermittedAuthTypeUnknownKey extends MovieMatchError {}
export class PermittedAuthTypeValueNotArray extends MovieMatchError {}
export class PermittedAuthTypeUnknownPermission extends MovieMatchError {}

export class TlsConfigInvalid extends MovieMatchError {}
export class TlsConfigCertFileInvalid extends MovieMatchError {}
export class TlsConfigKeyFileInvalid extends MovieMatchError {}
