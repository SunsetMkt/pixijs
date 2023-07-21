import { GlProgram } from '../../renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { Texture } from '../../renderers/shared/texture/Texture';
import { Filter } from '../shared/Filter';
import blendTemplateFrag from './blend-template.frag';
import blendTemplateVert from './blend-template.vert';
import blendTemplate from './blend-template.wgsl';

export interface BlendModeFilterOptions
{
    source?: string;
    gpu?: {
        functions?: string;
        main?: string;
    }
    gl?: {
        functions?: string;
        main?: string;
    }
}

export class BlendModeFilter extends Filter
{
    constructor(options: BlendModeFilterOptions)
    {
        const gpuOptions = options.gpu;

        const gpuSource = compileBlendModeShader({ source: blendTemplate, ...gpuOptions });

        const gpuProgram = new GpuProgram({
            vertex: {
                source: gpuSource,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source: gpuSource,
                entryPoint: 'mainFragment',
            },
        });

        const glOptions = options.gl;

        const glSource = compileBlendModeShader({ source: blendTemplateFrag, ...glOptions });

        const glProgram = new GlProgram({
            vertex: blendTemplateVert,
            fragment: glSource
        });

        const uniformGroup = new UniformGroup({
            uBlend: {
                value: 1,
                type: 'f32'
            }
        });

        super({
            gpuProgram,
            glProgram,
            blendRequired: true,
            resources: {
                blendUniforms: uniformGroup,
                backTexture: Texture.EMPTY
            }
        });
    }
}

function compileBlendModeShader(options: {source: string, functions?: string, main?: string}): string
{
    const { source, functions, main } = options;

    return source.replace('{FUNCTIONS}', functions).replace('{MAIN}', main);
}
